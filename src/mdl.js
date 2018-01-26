import { inject, customAttribute, DOM } from 'aurelia-framework';
import { componentHandler } from 'encapsulated-mdl';

let mdlTypes = {
  badge: {
    js: [],
    html: ['mdl-badge'],
    fct: []
  },
  button: {
    html: ['mdl-button', 'mdl-js-button'],
    js: ['MaterialButton'],
    fct: [manageRipple]
  },
  card: {
    js: [],
    html: ['mdl-card'],
    fct: []
  },
  checkbox: {
    js: ['MaterialCheckbox'],
    html: ['mdl-checkbox', 'mdl-js-checkbox'],
    fct: [manageRipple]
  },
  chip: {
    js: [],
    html: ['mdl-chip'],
    fct: []
  },
  'data-table': {
    js: ['MaterialDataTable'],
    html: ['mdl-data-table', 'mdl-js-data-table'],
    fct: [manageRipple]
  },
  dialog: {
    js: [],
    html: ['mdl-dialog'],
    fct: []
  },
  'mega-footer': {
    js: [],
    html: ['mdl-mega-footer'],
    fct: []
  },
  'mini-footer': {
    js: [],
    html: ['mdl-mini-footer'],
    fct: []
  },
  grid: {
    js: [],
    html: ['mdl-grid'],
    fct: []
  },
  'icon-toggle': {
    js: ['MaterialIconToggle'],
    html: ['mdl-icon-toggle', 'mdl-js-icon-toggle'],
    fct: [manageRipple]
  },
  layout: {
    js: ['MaterialLayout'],
    html: ['mdl-layout', 'mdl-js-layout'],
    fct: [manageRipple]
  },
  list: {
    js: [],
    html: ['mdl-list'],
    fct: []
  },
  menu: {
    js: ['MaterialMenu'],
    html: ['mdl-menu', 'mdl-js-menu'],
    fct: [manageRipple]
  },
  progress: {
    js: ['MaterialProgress'],
    html: ['mdl-progress', 'mdl-js-progress'],
    fct: []
  },
  radio: {
    js: ['MaterialRadio'],
    html: ['mdl-radio', 'mdl-js-radio'],
    fct: [manageRipple]
  },
  slider: {
    js: ['MaterialSlider'],
    html: ['mdl-slider', 'mdl-js-slider'],
    fct: []
  },
  snackbar: {
    js: ['MaterialSnackbar'],
    html: ['mdl-snackbar'],
    fct: []
  },
  spinner: {
    js: ['MaterialSpinner'],
    html: ['mdl-spinner', 'mdl-js-spinner'],
    fct: []
  },
  switch: {
    js: ['MaterialSwitch'],
    html: ['mdl-switch', 'mdl-js-switch'],
    fct: [manageRipple]
  },
  tabs: {
    js: ['MaterialTabs'],
    html: ['mdl-tabs', 'mdl-js-tabs'],
    fct: [manageRipple]
  },
  textfield: {
    js: ['MaterialTextfield'],
    html: ['mdl-textfield', 'mdl-js-textfield'],
    fct: []
  },
  tooltip: {
    js: ['MaterialTooltip'],
    html: ['mdl-tooltip'],
    fct: []
  },

  // Third party non official
  selectfield: {
    js: ['MaterialSelectfield'],
    html: ['mdl-selectfield'],
    fct: []
  }
};

function manageRipple(element) {
  if (element.classList.contains('mdl-js-ripple-effect')) {
    componentHandler.upgradeElement(element, 'MaterialRipple');
  }
  /**
   * Causes issues: upgrades nested elements that has mdl-js-ripple-effect class before the nested elements upgraded, marking them as
   * MaterialRipple upgraded, when the nested elements upgraded, and ripple upgrade tries to take place, it doesn't because it is already
   * marked as upgraded.
   * eventually causing rippleElement to be null on MaterialRipple.
   * NOTE: "mdl-js-ripple-effect" should be only on upgradable material elements, not on non material nested elements.
  let elements = element.querySelectorAll('.mdl-js-ripple-effect');
  for (let el of elements) {
    componentHandler.upgradeElement(el, 'MaterialRipple');
  }*/

  /** Some of the elements do require upgrade of nested elements, to avoid issues we must handle it carefully
   * NOTE: not sure about all the elements that require nested upgrading. Will add all the required when used and tested.
   */
  if (element.MaterialIconToggle || element.MaterialCheckbox || element.MaterialRadio) {
    /* We need to upgrade immediate children only, no easy way to do it (for all browsers) */
    let children = element.children;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (child.classList.contains('mdl-js-ripple-effect')) {
          componentHandler.upgradeElement(child, 'MaterialRipple');
        }
      }
    }
  }
}

function isUpgradedToRipple(element) {
  let dataUpgraded = element.getAttribute('data-upgraded');
  if (dataUpgraded === null)
    return false;

  let upgradedList = dataUpgraded.split(',');
  return upgradedList.indexOf('MaterialRipple') !== -1;
}

function getRippleContainer(element) {
  for (var i = 0; i < element.childNodes.length; i++) {
    if (element.childNodes[i].className && element.childNodes[i].className.indexOf("__ripple-container") !== -1) {
      return element.childNodes[i];
    }
  }
}

function upgradeElement(element, type) {
  let { html, fct, js } = (mdlTypes[type] || {});
  if (html) {
    for (let h of html) {
      element.classList.add(h);
    }
  }
  for (let t of js) componentHandler.upgradeElement(element, t);
  for (let f of fct) f(element);
}

function downgradeElement(element) {
  if (isUpgradedToRipple(element)) {
    let rippleContainer = getRippleContainer(element);
    if (rippleContainer) {
      componentHandler.downgradeElements(rippleContainer);
    }
  }
  componentHandler.downgradeElements(element);
  if(element["MaterialMenu"]) {
    downgradeMaterialMenu(element["MaterialMenu"]);
  }
  if(element["MaterialSpinner"]) {
    downgradeMaterialSpinner(element["MaterialSpinner"]);
  }
  if(element["MaterialButton"]) {
    downgradeMaterialButton(element["MaterialButton"]);
    element["MaterialButton"] = undefined;
  }
}

function downgradeMaterialMenu(materialMenu){
  materialMenu.container_.parentElement.insertBefore(materialMenu.element_, materialMenu.container_);
  materialMenu.container_.parentElement.removeChild(materialMenu.container_);

  // get rid of event listeners
  var clone = materialMenu.forElement_.cloneNode();
  while (materialMenu.forElement_.firstChild) {
    clone.appendChild(materialMenu.forElement_.lastChild);
  }
  materialMenu.forElement_.parentNode.replaceChild(clone, materialMenu.forElement_);

  materialMenu.forElement_ = undefined;
  materialMenu.container_ = undefined;
  materialMenu = undefined;
}

function downgradeMaterialSpinner(materialSpinner) {
  while (materialSpinner.element_.hasChildNodes()) {
    materialSpinner.element_.removeChild(materialSpinner.element_.lastChild);
  }
  materialSpinner = undefined;
}

function downgradeMaterialButton(materialButton) {
  materialButton.element_.removeEventListener('mouseup', materialButton.boundButtonBlurHandler);
  materialButton.element_.removeEventListener('mouseleave', materialButton.boundButtonBlurHandler);
}

@inject(DOM.Element)
@customAttribute('mdl')
export class MDLCustomAttribute {

  constructor(element) {
    this.element = element;
  }

  attached() {
    /**
     * MDL already checks for element being upgraded and does not upgrade it twice (unless downgrade is called).
     */
    upgradeElement(this.element, this.value);
  }

  detached() {
    /**
     * Aurelia keeps reference to DOM element and reuses same elements all over again.
     * MDL does not truly degrades elements: https://github.com/google/material-design-lite/issues/4209
     * so degrading in fact causing double upgrade on next attach.
     */
    downgradeElement(this.element);
  }
}
