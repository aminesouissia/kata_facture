import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Article } from '../_models/article';

@Injectable()
export class ArticleService {
  
  articleList: Article[] = [];
  
  getArticles(): Observable<Article[]> {
    return of(this.articleList);
  }
}
