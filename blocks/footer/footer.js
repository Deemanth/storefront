// Dropin Components
import {
  Button,
  provider as UI,
} from '@dropins/tools/components.js';

// Block-level
import createModal from '../modal/modal.js';
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { getRootPath, isMultistore } from '../../scripts/configs.js';

/**
 * Toggles all storeSelector sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleStoreDropdown(sections, expanded = false) {
  sections
    .querySelectorAll('.storeview-modal .default-content-wrapper > ul > li')
    .forEach((section) => {
      section.setAttribute('aria-expanded', expanded);
    });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const root = getRootPath();
  // Load Footer as Fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  //group and add wrapper class for picture tag
  const firstSection = fragment.querySelector('.section:first-of-type')
  const defaultContent = firstSection.querySelector('.default-content-wrapper');
  const pictureTags = firstSection.querySelector('picture').parentElement;
  pictureTags.className = 'picture-wrapper';

  //group header,information and button class 
  const header = firstSection.querySelector('h2');
  const info = header.nextSibling; 
  const button = info.nextSibling;

  const catalogWrapper = document.createElement('div');
  catalogWrapper.className = 'header-info-button-wrapper';
  catalogWrapper.appendChild(header);
  catalogWrapper.appendChild(info);
  catalogWrapper.appendChild(button);
  defaultContent.insertBefore(catalogWrapper, pictureTags.nextSibling);


  //target the first section and add wrapper to icon class
  const icons = firstSection.querySelectorAll('span.icon');
  let followUsWrapper = null;
  if (icons.length > 0) {
    // Create the wrapper div
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'social-icons'; // You can change this class name

    // Move all icon spans into the wrapper
    icons.forEach(icon => {
      iconWrapper.appendChild(icon);
    });

    // Insert the wrapper into the paragraph, just after "Follow US:"
    followUsWrapper = firstSection.lastChild.lastChild;
    followUsWrapper.className = "follow-us";
    followUsWrapper.appendChild(iconWrapper);
  }

  //group picture and heading container into a wrapper
  const flexRow = document.createElement('div');
  flexRow.className = 'flex-row-wrapper';

  // Move header and picture into the new flex container
  flexRow.appendChild(pictureTags);
  flexRow.appendChild(catalogWrapper);

  // Insert the flex container before .follow-us (so follow-us stays below)
  defaultContent.insertBefore(flexRow, followUsWrapper);

  //check for list to accordion
  if (window.matchMedia("(max-width: 375px)").matches) {
    const mainList = fragment.querySelector("ul"); // Assuming the first <ul> is the root
    mainList.classList.add("accordion");
    mainList.setAttribute("role", "list");
  
    const items = mainList.querySelectorAll(":scope > li");
  
    items.forEach((li, index) => {
      const sublist = li.querySelector("ul");
      if (sublist) {
        const text = li.firstChild.textContent.trim();
        const checkboxId = `accordion-item-${index + 1}`;
        const regionId = `accordion-region-${index + 1}`;
  
        // Clear li contents
        li.innerHTML = "";
  
        // Create and append checkbox (visually hidden but screen-reader accessible)
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = checkboxId;
        checkbox.classList.add("sr-only"); // Add a CSS class to visually hide it
        li.appendChild(checkbox);
  
        // Create and append label acting as toggle button
        const label = document.createElement("label");
        label.setAttribute("for", checkboxId);
        label.setAttribute("role", "button");
        label.setAttribute("aria-expanded", "false");
        label.setAttribute("aria-controls", regionId);
        label.id = `accordion-label-${index + 1}`;
        label.tabIndex = 0; // Make it focusable
        label.textContent = text;
        li.appendChild(label);
  
        // Handle keyboard accessibility
        label.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            checkbox.checked = !checkbox.checked;
            label.setAttribute("aria-expanded", checkbox.checked);
            sublist.hidden = !checkbox.checked;
          }
        });
  
        // Sync ARIA state when toggled
        checkbox.addEventListener("change", () => {
          label.setAttribute("aria-expanded", checkbox.checked);
          sublist.hidden = !checkbox.checked;
        });
  
        // Setup sublist region
        sublist.id = regionId;
        sublist.setAttribute("role", "region");
        sublist.setAttribute("aria-labelledby", label.id);
        sublist.hidden = true;
  
        li.appendChild(sublist);
      }
    });
  }
  

   //get the last section and add the wrapper class to icon class
  const lastSection = fragment.querySelector('.section:last-of-type');
  const iconsParent =  lastSection.querySelector("span.icon").parentElement;
  iconsParent.className = "payment-cards";


     //add top-row class inside the first section wrapping first two sections
     const topRow = document.createElement('div');
     topRow.className = 'top-row-wrapper';
     //const section1 = fragment.querySelector('.section:first-of-type');
     const secondSection = fragment.querySelector('.section:nth-of-type(2)');
   
     // Move section1 and section2 into top-row
     topRow.appendChild(firstSection);
     topRow.appendChild(secondSection);
     fragment.insertBefore(topRow, fragment.firstChild);

  //while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(fragment);
}
