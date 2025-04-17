import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-file-demo',
  imports: [FileUploadModule, ToastModule, ButtonModule],
  templateUrl: './file-demo.component.html',
  styleUrl: './file-demo.component.css',
})
export class FileDemoComponent {
  private readonly messageService = inject(MessageService);

  uploadedFiles: File[] = [];

  onUpload(event: { files: File[] }) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Success',
      detail: 'File Uploaded',
    });
  }

  onBasicUpload() {
    this.messageService.add({
      severity: 'info',
      summary: 'Success',
      detail: 'File Uploaded with Basic Mode',
    });
  }
}
