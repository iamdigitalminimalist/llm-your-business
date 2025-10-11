import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  MapPin,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Users,
  Calendar,
} from 'lucide-react';
import type { Partner } from './partners.api';
import { formatDistanceToNow } from 'date-fns';

interface PartnerCardProps {
  partner: Partner;
  onEdit?: (partner: Partner) => void;
  onDelete?: (partnerId: string) => void;
  onView?: (partner: Partner) => void;
}

type PartnerType = Partner['partnerType'];

const partnerTypeConfig: Record<
  PartnerType,
  { label: string; color: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  RESTAURANT: { label: 'Restaurant', color: 'default' },
  TECH: { label: 'Technology', color: 'secondary' },
  RETAIL: { label: 'Retail', color: 'outline' },
  SERVICE: { label: 'Service', color: 'outline' },
  HEALTHCARE: { label: 'Healthcare', color: 'secondary' },
  EDUCATION: { label: 'Education', color: 'outline' },
  OTHER: { label: 'Other', color: 'outline' },
};

export function PartnerCard({
  partner,
  onEdit,
  onDelete,
  onView,
}: PartnerCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const typeConfig = partnerTypeConfig[partner.partnerType];
  const location = [partner.city, partner.state, partner.country]
    .filter(Boolean)
    .join(', ');

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {getInitials(partner.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg leading-none mb-1">
                {partner.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant={typeConfig.color} className="text-xs">
                  {typeConfig.label}
                </Badge>
                <Badge
                  variant={partner.isActive ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {partner.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(partner)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(partner)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Partner
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(partner.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Partner
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {partner.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {partner.description}
          </p>
        )}

        <div className="space-y-2">
          {partner.industry && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Building2 className="mr-2 h-3 w-3" />
              {partner.industry}
            </div>
          )}

          {location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-2 h-3 w-3" />
              {location}
            </div>
          )}

          {partner.website && (
            <div className="flex items-center text-sm text-muted-foreground">
              <ExternalLink className="mr-2 h-3 w-3" />
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {partner.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 items-start">
        <div className="flex w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {partner._count?.products && (
              <div className="flex items-center">
                <Users className="mr-1 h-3 w-3" />
                {partner._count.products} products
              </div>
            )}
          </div>
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            Creadted{' '}
            {formatDistanceToNow(new Date(partner.createdAt), {
              addSuffix: true,
            })}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
