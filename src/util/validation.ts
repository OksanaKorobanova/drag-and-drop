export interface Validatable {
  value: string | number;
  required?: boolean;
  minLenght?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validate(validationObj: Validatable): boolean {
  let isValid = true;
  if (validationObj.required) {
    isValid = isValid && validationObj.value.toString().trim().length !== 0;
  }
  if (
    validationObj.minLenght != null &&
    typeof validationObj.value === 'string'
  ) {
    isValid = isValid && validationObj.value.length > validationObj.minLenght;
  }
  if (
    validationObj.maxLength != null &&
    typeof validationObj.value === 'string'
  ) {
    isValid = isValid && validationObj.value.length < validationObj.maxLength;
  }
  if (validationObj.min != null && typeof validationObj.value === 'number') {
    isValid = isValid && validationObj.value > validationObj.min;
  }
  if (validationObj.max != null && typeof validationObj.value === 'number') {
    isValid = isValid && validationObj.value < validationObj.max;
  }
  return isValid;
}
