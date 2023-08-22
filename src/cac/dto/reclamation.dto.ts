import { IsBase64, IsNotEmpty,  IsOptional,  IsString  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';




export class ReclamationDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceToken: string;
  
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsOptional()
  @IsBase64()
  preuve: string;

 
}
