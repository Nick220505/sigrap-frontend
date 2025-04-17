import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FluidModule } from 'primeng/fluid';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { KnobModule } from 'primeng/knob';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { TextareaModule } from 'primeng/textarea';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TreeSelectModule } from 'primeng/treeselect';
import { CountryService } from '../../services/country.service';
import { Country } from '../../services/customer.service';
import { NodeService } from '../../services/node.service';

interface ListboxItem {
  name: string;
  code: string;
}

interface SelectButtonItem {
  name: string;
}

@Component({
  selector: 'app-input-demo',
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    RadioButtonModule,
    SelectButtonModule,
    InputGroupModule,
    FluidModule,
    IconFieldModule,
    InputIconModule,
    FloatLabelModule,
    AutoCompleteModule,
    InputNumberModule,
    SliderModule,
    RatingModule,
    ColorPickerModule,
    KnobModule,
    SelectModule,
    DatePickerModule,
    ToggleButtonModule,
    ToggleSwitchModule,
    TreeSelectModule,
    MultiSelectModule,
    ListboxModule,
    InputGroupAddonModule,
    TextareaModule,
  ],
  templateUrl: './input-demo.component.html',
  styleUrl: './input-demo.component.css',
})
export class InputDemoComponent implements OnInit {
  floatValue: number | null = null;

  autoValue: Country[] | undefined;

  autoFilteredValue: Country[] = [];

  selectedAutoValue: Country | null = null;

  calendarValue: Date | null = null;

  inputNumberValue: number | null = null;

  sliderValue = 50;

  ratingValue: number | null = null;

  colorValue = '#1976D2';

  radioValue: string | null = null;

  checkboxValue: string[] = [];

  switchValue = false;

  listboxValues: ListboxItem[] = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
  ];

  listboxValue: ListboxItem | null = null;

  dropdownValues: ListboxItem[] = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
  ];

  dropdownValue: ListboxItem | null = null;

  multiselectCountries: Country[] = [
    { name: 'Australia', code: 'AU' },
    { name: 'Brazil', code: 'BR' },
    { name: 'China', code: 'CN' },
    { name: 'Egypt', code: 'EG' },
    { name: 'France', code: 'FR' },
    { name: 'Germany', code: 'DE' },
    { name: 'India', code: 'IN' },
    { name: 'Japan', code: 'JP' },
    { name: 'Spain', code: 'ES' },
    { name: 'United States', code: 'US' },
  ];

  multiselectSelectedCountries!: Country[];

  toggleValue = false;

  selectButtonValue: SelectButtonItem | null = null;

  selectButtonValues: SelectButtonItem[] = [
    { name: 'Option 1' },
    { name: 'Option 2' },
    { name: 'Option 3' },
  ];

  knobValue = 50;

  inputGroupValue = false;

  treeSelectNodes!: TreeNode[];

  selectedNode: TreeNode | null = null;

  countryService = inject(CountryService);

  nodeService = inject(NodeService);

  ngOnInit() {
    this.countryService.getCountries().then((countries) => {
      this.autoValue = countries;
    });

    this.nodeService.getFiles().then((data) => (this.treeSelectNodes = data));
  }

  filterCountry(event: AutoCompleteCompleteEvent) {
    const filtered: Country[] = [];
    const query = event.query;

    for (const country of this.autoValue || []) {
      if (country.name?.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(country);
      }
    }

    this.autoFilteredValue = filtered;
  }
}
