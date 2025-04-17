import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';

import { NodeService } from '../../services/node.service';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-tree-demo',
  imports: [FormsModule, TreeModule, TreeTableModule],
  templateUrl: './tree-demo.component.html',
  styleUrl: './tree-demo.component.css',
})
export class TreeDemoComponent implements OnInit {
  treeValue: TreeNode[] = [];

  treeTableValue: TreeNode[] = [];

  selectedTreeValue: TreeNode[] = [];

  selectedTreeTableValue = {};

  cols: Column[] = [];

  nodeService = inject(NodeService);

  ngOnInit() {
    this.nodeService.getFiles().then((files) => (this.treeValue = files));
    this.nodeService
      .getTreeTableNodes()
      .then((files: TreeNode[]) => (this.treeTableValue = files));

    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'size', header: 'Size' },
      { field: 'type', header: 'Type' },
    ];

    this.selectedTreeTableValue = {
      '0-0': {
        partialChecked: false,
        checked: true,
      },
    };
  }
}
