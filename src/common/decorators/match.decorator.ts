/* eslint-disable prettier/prettier */
import { 
    registerDecorator, 
    ValidationOptions, 
    ValidationArguments, 
    ValidatorConstraintInterface,
    ValidatorConstraint
} from 'class-validator';

@ValidatorConstraint({ name: 'match' })
class MatchValidator implements ValidatorConstraintInterface {
    validate(value: unknown, args: ValidationArguments): boolean {
        const [relatedPropertyName] = args.constraints as string[];
        const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
        return typeof value === 'string' && typeof relatedValue === 'string' && value === relatedValue;
    }

    defaultMessage(args: ValidationArguments): string {
        const [relatedPropertyName] = args.constraints as string[];
        return `Value must match ${relatedPropertyName}`;
    }
}

export function Match(property: string, validationOptions?: ValidationOptions): PropertyDecorator {
    return (target: object, propertyKey: string | symbol): void => {
        registerDecorator({
            name: 'match',
            target: target.constructor,
            propertyName: propertyKey.toString(),
            constraints: [property],
            options: validationOptions,
            validator: new MatchValidator()
        });
    };
}