import { Injectable } from '@angular/core';
import { Article } from '../_models/article';

@Injectable()
export class ArticleService {
  
  articleList: Article[] = [];
  
  getArticles() {
    return this.articleList;
  }
}
