import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BLOG_POSTS } from '../blog/blog-posts';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: 'app-blog-detail',
  styleUrl: './blog-detail.component.css',
  templateUrl: './blog-detail.component.html',
})
export class BlogDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug'))),
    { initialValue: this.route.snapshot.paramMap.get('slug') },
  );

  protected readonly article = computed(
    () => BLOG_POSTS.find((post) => post.slug === this.slug()) ?? null,
  );
}
