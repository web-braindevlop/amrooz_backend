export class ReviewResponseDto {
  id: number;
  rating: number;
  title: string;
  comment: string;
  authorName: string;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  productId: number;
  customerId: number;
  createdAt: Date;
  customerFirstName?: string;
  customerLastName?: string;
}
