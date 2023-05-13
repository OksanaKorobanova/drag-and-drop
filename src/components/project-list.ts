import { Component } from './base-component';
import { DragTarget } from '../models/drag-drop';
import { ProjectStatus, Project } from '../models/project';
import { autobind } from '../decorators/autobind';
import { projectState } from '../state/project-state';
import { ProjectItem } from './project-item';

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listElem = this.element.querySelector('ul')!;
      listElem.classList.add('droppable');
    }
  }

  @autobind
  dragHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData('text/plain');
    projectState.updateProjectStatus(
      projectId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autobind
  dragLeaveHandler(_: DragEvent): void {
    const listElem = this.element.querySelector('ul')!;
    listElem.classList.remove('droppable');
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dragHandler);

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
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector(
      'h2'
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProjects() {
    const listElem = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listElem.innerHTML = '';
    for (const item of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, item);
    }
  }
}
