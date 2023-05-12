// validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLenght?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validationObj: Validatable): boolean {
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

// decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

enum ProjectStatus {
  Active,
  Finished,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public peopleAmount: number,
    public status: ProjectStatus
  ) {}
}

type Listener = (items: Project[]) => void;

class ProjectState {
  private projects: Project[] = [];
  private listeners: Listener[] = [];
  private static instance: ProjectState;
  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, peopleAmount: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      peopleAmount,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice()); // give a copy
    }
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }
}

const projectState = ProjectState.getInstance();

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById(
      'project-list'
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.assignedProjects = [];

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: Project[]) => {
      const projectsByStatus = projects.filter((el) => {
        if (this.type === 'active') {
          return el.status === ProjectStatus.Active;
        }
        return el.status === ProjectStatus.Finished;
      });
      this.assignedProjects = projectsByStatus;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listElem = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listElem.innerHTML = '';
    for (const item of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = item.title;
      listElem.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector(
      'h2'
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      'project-input'
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

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
    this.attach();
  }

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

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const inputForm = new ProjectInput();
const activeProjectsList = new ProjectList('active');
const finishedProjectsList = new ProjectList('finished');
