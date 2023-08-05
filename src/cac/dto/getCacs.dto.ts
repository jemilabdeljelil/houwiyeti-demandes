import { IsArray, IsNotEmpty, IsObject, IsString, Validate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Coordinates {
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
  @IsNotEmpty()
  @IsString()
  type: 'Point';

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Coordinates)
  coordinates: Coordinates;
}

export class getCacDTO {
  @IsNotEmpty()
  @IsString()
  uid: string;

  @IsNotEmpty()
  @IsString()
  deviceToken: string;

  @IsNotEmpty()
  @IsObject()
  location: Location;
}
