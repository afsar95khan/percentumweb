import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BLOG_POSTS } from './blog-posts';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: 'app-blog',
  styleUrl: './blog.component.css',
  templateUrl: './blog.component.html',
})
export class BlogComponent {
  protected readonly currentPage = signal(0);
  protected readonly postsPerPage = 9;

  protected readonly blogPosts = BLOG_POSTS;

  protected readonly totalPages = () => Math.ceil(this.blogPosts.length / this.postsPerPage);
  protected readonly pageIndexes = () => Array.from({ length: this.totalPages() }, (_, index) => index);

  protected pagePosts(pageIndex: number) {
    const start = pageIndex * this.postsPerPage;
    return this.blogPosts.slice(start, start + this.postsPerPage);
  };

  protected movePage(direction: -1 | 1): void {
    this.currentPage.update((page) => (page + direction + this.totalPages()) % this.totalPages());
  }
}
