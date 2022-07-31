import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Article } from 'src/app/_models/article';
import { ArticleService } from 'src/app/_services/article.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Composant correspondant à la page home component
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  /**
   * Date actuelle
   */
  date = new Date();
  /**
   * Formulaire
   */
  tableForm!: FormGroup;
  /**
   * Liste d'articles
   */
  articleList: Article[] = [];
  /**
   * Valeur de la totale des taxes
   */
  total_Taxes = 0;
  /**
   * Valeur de la totale hors TVA
   */
  prix_Total_ht = 0;
  /**
   * Valeur de la totale toute taxe comprise
   */
  prix_Total_ttc = 0;
  /**
   * Valeurs de l'entete de la table
   */
  headers = [
    'Description',
    'Prix',
    'Type',
    'Quantitées',
    'Importé',
    'Taxes',
    'Total HT',
    'Total TTC',
  ];
  /**
   * Valeurs de la select
   */
  selectOption = ['Premiére nécissité', 'Livre', 'Autre'];
  /**
   *
   * @param fb formBuilder
   * @param articleService service de récupération des articles
   */
  constructor(public fb: FormBuilder, private articleService: ArticleService) {}
  /**
   * Initialisation du composant
   */
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
  /**
   * Reinitialisation du formulaire
   */
  ResetForm(): void {
    this.tableForm.reset();
  }
  /**
   * Permet d'ajouter un article à la liste
   */
  addArticle() {
    if (this.tableForm.valid) {
      this.articleService.articleList.push(this.tableForm.value);
      this.ResetForm();
      this.totalHT();
      this.totalTTC();
      this.totalTaxes();
    } else {
      Object.keys(this.tableForm.controls).forEach((field) => {
        const control = this.tableForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
    }
  }
  /**
   * Permet de calculer la totale hors TVA pour un article
   * 
   */
  getTotalHT() {
    const prix = this.tableForm.controls['prix_unitaire'].value;
    const quantite = this.tableForm.controls['quantitees'].value;
    let totalHt = Math.ceil(quantite * prix * 20) / 20;
    this.tableForm.controls['total_ht'].setValue(totalHt);
    return totalHt;
  }
  /**
   * Retourne la taxe pour un article
   * 
   */
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
  /**
   * Permet de calculer la totale toute taxe comprise pour un article
   * 
   */
  getTotalTTC(): number {
    let taxes = this.getTaxesTt();
    let totalHT = this.getTotalHT();
    this.tableForm.controls['total_ttc'].setValue(taxes + totalHT);
    return taxes + totalHT;
  }
  /**
   *Permet de calculer la taxe pour les articles importés
   * 
   */
  getTaxesImporte(): number {
    const quantite = this.tableForm.controls['quantitees'].value;
    const prix = this.tableForm.controls['prix_unitaire'].value;
    const value = Math.ceil(quantite * ((prix * 5) / 100) * 20) / 20;
    const importe = this.tableForm.controls['importe'].value;
    return importe === 'oui' ? value : 0;
  }
  /**
   * Permet de calculer la taxe totale pour un article
   * 
   */
  getTaxesTt(): number {
    let taxestt = this.getTaxes() + this.getTaxesImporte();
    this.tableForm.controls['taxes'].setValue(taxestt);
    return taxestt;
  }
  /**
   * Fonction pour calculer la totale des taxes de tous les articles
   */
  totalTaxes() {
    const initialValue = 0;
    this.total_Taxes = this.articleList
      .map((item) => item.taxes)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        initialValue
      );
  }
  /**
   * Fonction pour calculer la totale HT de tous les articles
   */
  totalHT() {
    const initialValue = 0;
    this.prix_Total_ht = this.articleList
      .map((item) => item.total_ht)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        initialValue
      );
  }
  /**
   * Fonction pour calculer la totale TTC de tous les articles
   */
  totalTTC() {
    const initialValue = 0;
    this.prix_Total_ttc = this.articleList
      .map((item) => item.total_ttc)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue,
        initialValue
      );
  }
  /**
   * Permet de générer une facture en pdf
   */
  generatePdf() {
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
