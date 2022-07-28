import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Article } from 'src/app/_models/article';
import { ArticleService } from 'src/app/_services/article.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  date = new Date();
  tableForm!: FormGroup;
  articleList: Article[] = [];
  total_Taxes = 0;
  prix_Total_ht = 0;
  prix_Total_ttc = 0;

  headers = [
    'Description',
    'Prix',
    'Type',
    'Quantitées',
    'Importé',
    'Taxes',
    'Total HT',
    'Total TTC',
    'Prix Total HT',
  ];
  selectOption = ['Premiére nécissité', 'Livre', 'Autre'];

  constructor(public fb: FormBuilder, private articleService: ArticleService) {}

  ngOnInit(): void {
    this.articleList = this.articleService.getArticles();
    this.tableForm = this.fb.group({
      description: ['', Validators.required],
      prix_unitaire: [0, Validators.required],
      type: ['', Validators.required],
      quantitees: [0, Validators.required],
      importe: ['non', Validators.required],
      taxes: [0, Validators.required],
      total_ht: [0, Validators.required],
      total_ttc: [0, Validators.required],
    });
  }

  ResetForm(): void {
    this.tableForm.reset();
  }

  addArticle() {
    this.articleService.articleList.push(this.tableForm.value);
    this.ResetForm();
    this.totalHT();
    this.totalTTC();
    this.totalTaxes();
  }

  getTotalHT() {
    const prix = this.tableForm.controls['prix_unitaire'].value;
    const quantite = this.tableForm.controls['quantitees'].value;
    let totalHt = Math.ceil(quantite * prix * 20) / 20;
    this.tableForm.controls['total_ht'].setValue(totalHt);
    return totalHt;
  }

  getTaxes(): number {
    const type = this.tableForm.controls['type'].value;
    const prix = this.tableForm.controls['prix_unitaire'].value;
    const quantite = this.tableForm.controls['quantitees'].value;

    let taxes: number = 0;

    switch (type) {
      case 'Livre':
        taxes = Math.ceil(quantite * ((prix * 10) / 100) * 20) / 20;
        break;
      case 'Autre':
        taxes = Math.ceil(quantite * ((prix * 20) / 100) * 20) / 20;
        break;
    }
    return taxes;
  }

  getTotalTTC(): number {
    let taxes = this.getTaxesTt();
    let totalHT = this.getTotalHT();
    this.tableForm.controls['total_ttc'].setValue(taxes + totalHT);
    return taxes + totalHT;
  }

  getTaxesImporte(): number {
    const quantite = this.tableForm.controls['quantitees'].value;
    const prix = this.tableForm.controls['prix_unitaire'].value;
    const value = Math.ceil(quantite * ((prix * 5) / 100) * 20) / 20;
    const importe = this.tableForm.controls['importe'].value;
    return importe === 'oui' ? value : 0;
  }

  getTaxesTt(): number {
    let taxestt = this.getTaxes() + this.getTaxesImporte();
    this.tableForm.controls['taxes'].setValue(taxestt);
    return taxestt;
  }

  getTotal(arr: any[]) {
    return arr.reduce((sum, curr) => sum + curr.Total, 0);
  }

  totalTaxes() {
    const initialValue = 0;
    this.total_Taxes = this.articleList
      .map((item) => item.taxes)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        initialValue
      );
  }

  totalHT() {
    const initialValue = 0;
    this.prix_Total_ht = this.articleList
      .map((item) => item.total_ht)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        initialValue
      );
  }
  totalTTC() {
    const initialValue = 0;
    this.prix_Total_ttc = this.articleList
      .map((item) => item.total_ttc)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        initialValue
      );
  }

  generatePdf(){
 let data = document.getElementById('table');
 html2canvas(data).then((canvas) => {
   let docWidth = 508;
   let docHeight = (canvas.height * docWidth) / canvas.width;
   const contentDataURL = canvas.toDataURL('image/png');
   let doc = new jsPDF('p', 'mm', 'a4');
   let position = 0;
   doc.addImage(contentDataURL, 'PNG', 0, position, docWidth, docHeight);
   doc.save('facture.pdf');
 });
  }
}
