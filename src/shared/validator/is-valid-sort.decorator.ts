import { SORT } from '@App/shared/constants/sort.enum.constant';
import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidSortConstraint implements ValidatorConstraintInterface {
  constructor() {}

  validate(value: any) {
    if (typeof value === 'object') {
      for (const key in value) {
        if (!Object.values(SORT).includes(value[key] as SORT)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be an object with valid SORT values`;
  }
}

export function IsValidSort(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidSortConstraint,
    });
  };
}
