
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessageDTO {
    constructor(
      
      type: 'successCode' | 'errorCode',
  
     
      code: number,
    ) {
      this.type = type;
      this.code = code;
    }
  
    @IsNotEmpty()
    @IsString()
    type: 'successCode' | 'errorCode';
  
    @IsNotEmpty()
    @IsNumber()
    code: number;
  }
