import { Component } from './base-component';
import { Draggable } from '../models/drag-drop';
import { Project } from '../models/project';
import { autobind } from '../decorators/autobind';

export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get peopleText() {
    if (this.project.peopleAmount === 1) {
      return '1 person';
    } else {
      return `${this.project.peopleAmount} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndTarget(_: DragEvent): void {
    console.log('dragEnd');
  }

  configure(): void {
    this.element.addEventListener('dragstart', this.dragStartHandler);
  }

  renderContent(): void {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector(
      'h3'
    )!.textContent = `${this.peopleText} assigned`;

    this.element.querySelector('p')!.textContent = this.project.description;
  }
}
