import { type Request, type Response } from 'express';
import { ObjectId } from 'mongodb';
import { partnerService } from '../services/partner.service';

export const partnerController = {
  getPartners: async (req: Request, res: Response) => {
    try {
      console.info('🔍 Looking for partners...');

      const partners = await partnerService.getPartners();
      console.info(`✅ Found ${partners.length} partners`);

      res.json({
        success: true,
        count: partners.length,
        data: partners,
      });
    } catch (error) {
      console.error('Error fetching partners:', error);
      res.status(500).json({
        error: 'Failed to fetch partners',
        message: error,
      });
    }
  },

  getPartner: async (req: Request, res: Response) => {
    try {
      const partnerId = req.params.id;
      console.info('🔍 Looking for partner with ID:', partnerId);

      if (!partnerId) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Partner ID is required',
        });
      }

      if (!ObjectId.isValid(partnerId)) {
        return res.status(400).json({
          error: 'Invalid ID format',
          message: 'Partner ID must be a valid MongoDB ObjectId',
        });
      }

      const partner = await partnerService.getPartnerById(
        new ObjectId(partnerId)
      );

      if (!partner) {
        return res.status(404).json({
          error: 'Partner not found',
          message: `No partner found with ID: ${partnerId}`,
        });
      }

      console.info('✅ Found partner:', partner.name);

      res.json({
        success: true,
        data: partner,
      });
    } catch (error) {
      console.error('Error fetching partner:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to fetch partner data',
      });
    }
  },
};
