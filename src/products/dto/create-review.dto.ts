import { IsInt, IsNumber, Min, Max, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  productId: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
