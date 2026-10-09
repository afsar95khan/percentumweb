import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APIService } from '../../core/services/api.service';

interface Project {
  company: string;
  title: string;
  loanAmount: string;
  netReturn: string;
  term: string;
  riskClass: string;
  progress: number;
  image: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: 'app-crowdfunding',
  styleUrl: './crowdfunding.component.css',
  templateUrl: './crowdfunding.component.html',
})
export class CrowdfundingComponent {
  private readonly api = inject(APIService);
  protected readonly returnComparisons = [
    { label: 'DNB Fastrenteinnskudd', className: 'bar-navy' },
    { label: 'ODIN Rente', className: 'bar-green' },
    { label: 'Oslo Børs', className: 'bar-red' },
    { label: 'Crowdfunding', className: 'bar-gold' },
  ];



  protected projects = signal<any[]>([]);

  ngOnInit() {
    this.getProjects()
  }
  getProjects() {
    const endpoint = 'project/all-project';
     this.api.get('', endpoint).subscribe((res: any) => {
      if (res.success) {
           this.projects.set(res.data.filter((item:any)=>item.project_type=='internal'))
      }
    });
  }
}
