#!/usr/bin/env python3
import asyncio
import json
from aiokafka import AIOKafkaProducer

TEST_EVENT = {
    "manifest_id": "0bce84e3-abf5-4546-8302-43aacb248b16",
    "execution_id": "7f243ace-14d5-48f9-a18c-d655181150f4", 
    "objective_id": "68e8e943a7911ce6d45e4c34",
    "question_id": "40227177-1bf6-45c7-be48-240962d6db29",
    "persona": {},
    "language": "EN",
    "model": "chat_gpt5"
}

async def send_test_event():
    producer = AIOKafkaProducer(
        bootstrap_servers='localhost:9092',
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    
    try:
        await producer.start()
        print("✅ Connected to Kafka")
        
        topic = "objective.execution.question"
        await producer.send(topic, TEST_EVENT)
        
        print(f"📤 Sent test event to topic '{topic}':")
        print(f"   Manifest ID: {TEST_EVENT['manifest_id']}")
        print(f"   Execution ID: {TEST_EVENT['execution_id']}")
        print(f"   Objective ID: {TEST_EVENT['objective_id']}")
        print(f"   Question ID: {TEST_EVENT['question_id']}")
        print(f"   Model: {TEST_EVENT['model']}")
        print(f"   Language: {TEST_EVENT['language']}")
        
        await producer.flush()
        print("✅ Event sent successfully!")
        
    except Exception as e:
        print(f"❌ Error sending event: {e}")
        return 1
        
    finally:
        await producer.stop()
        print("🔌 Kafka producer stopped")
        
    return 0


if __name__ == "__main__":
    print("🧪 Kafka Test Event Sender")
    print("=" * 40)
    
    try:
        exit_code = asyncio.run(send_test_event())
        exit(exit_code)
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user")
        exit(1)
    except Exception as e:
        print(f"💥 Unexpected error: {e}")
        exit(1)