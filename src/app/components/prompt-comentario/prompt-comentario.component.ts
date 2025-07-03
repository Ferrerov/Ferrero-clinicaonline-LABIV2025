import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { EnumComentarios } from '../../models/enumComentarios';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prompt-comentario',
  imports: [CommonModule,MatButtonModule,MatInputModule,MatFormFieldModule,MatDialogActions,MatDialogContent,MatDialogModule,FormsModule],
  templateUrl: './prompt-comentario.component.html',
  styleUrl: './prompt-comentario.component.scss',
  standalone: true
})
export class PromptComentarioComponent {
  data = inject(MAT_DIALOG_DATA);
  comentarioTexto: string = '';
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if(this.data.comentario)
    {
      this.comentarioTexto = this.data.comentario;
    }
    console.log(this.comentarioTexto);
  }
}
