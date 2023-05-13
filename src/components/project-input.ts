import { Component } from './base-component';
import { autobind } from '../decorators/autobind';
import { projectState } from '../state/project-state';
import { Validatable, validate } from '../util/validation';

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.titleInputElement = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      '#people'
    ) as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent(): void {}

  private gatherUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const peopleAmount = this.peopleInputElement.value;

    const titleValidationObj: Validatable = {
      value: title,
      required: true,
    };
    const descrValidationObj: Validatable = {
      value: description,
      required: true,
      minLenght: 5,
    };
    const peopleValidationObj: Validatable = {
      value: +peopleAmount,
      required: true,
      min: 1,
      max: 4,
    };

    if (
      !validate(titleValidationObj) ||
      !validate(descrValidationObj) ||
      !validate(peopleValidationObj)
    ) {
      alert('Invalid input');
    } else {
      return [title, description, +peopleAmount];
    }
  }

  private clearInputs(): void {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const inputValues = this.gatherUserInput();
    if (Array.isArray(inputValues)) {
      const [title, description, people] = inputValues;
      projectState.addProject(title, description, people);
      console.log(title, description, people);
      this.clearInputs();
    }
  }
}
