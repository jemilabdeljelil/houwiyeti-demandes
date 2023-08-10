import { IsArray, IsNotEmpty, IsObject, IsString, Validate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class Coordinates {
  @ApiProperty({ description: 'An array of two numbers: [longitude, latitude]' })
  @IsArray()
  @IsNotEmpty()
  @Type(() => Number)
  @Validate((value: any) => {
    if (value.length !== 2 || isNaN(value[0]) || isNaN(value[1])) {
      return false;
    }
    return true;
  }, {
    message: 'Coordinates must be an array of two numbers: [longitude, latitude]'
  })
  coordinates: [number, number];
}

class Location {
  @ApiProperty({ description: 'The type of location (e.g., Point)' })
  @IsNotEmpty()
  @IsString()
  type: 'Point';

  @ApiProperty({ type: Coordinates })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Coordinates)
  coordinates: Coordinates;
}

export class getLivraisonDetailsDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  uid: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceToken: string;

  @ApiProperty({ type: Location })
  @IsNotEmpty()
  @IsObject()
  location: Location;
}
