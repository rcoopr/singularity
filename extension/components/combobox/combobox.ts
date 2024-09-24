interface Option {
  label: string;
  quickAction?: () => void;
}

const initializeCustomCombobox = (comboboxElement: HTMLElement | null, options: Option[]) => {
  if (!comboboxElement) return;

  const inputElement = comboboxElement.querySelector('input') as HTMLInputElement;
  const clearButton = comboboxElement.querySelector('.clear-btn') as HTMLButtonElement;
  const dropdownElement = comboboxElement.querySelector('.dropdown') as HTMLDivElement;

  const handleInputChange = () => {
    const searchTerm = inputElement.value.toLowerCase();
    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm)
    );
    toggleOptionVisibility(filteredOptions);
    toggleDropdown(true);
  };

  const clearInput = () => {
    inputElement.value = '';
    handleInputChange();
  };

  const toggleDropdown = (show: boolean) => {
    dropdownElement.classList.toggle('show', show);
  };

  const toggleOptionVisibility = (visibleOptions: Option[]) => {
    const optionElements = dropdownElement.querySelectorAll<HTMLDivElement>('.dropdown-option');
    optionElements.forEach((optionElement) => {
      const optionLabel = optionElement.querySelector<HTMLButtonElement>('.main-btn')?.textContent;
      const shouldShow = visibleOptions.some((option) => option.label === optionLabel);
      optionElement.style.display = shouldShow ? 'flex' : 'none';
    });
  };

  const renderOptions = () => {
    dropdownElement.innerHTML = '';
    options.forEach((option) => {
      const optionElement = document.createElement('div');
      optionElement.classList.add('dropdown-option');
      optionElement.innerHTML = `
        <button class="main-btn">${option.label}</button>
        <button class="quick-action-btn">&#9733;</button>
      `;
      const mainButton = optionElement.querySelector<HTMLButtonElement>('.main-btn')!;
      const quickActionButton =
        optionElement.querySelector<HTMLButtonElement>('.quick-action-btn')!;
      mainButton.addEventListener('click', (event) => {
        inputElement.value = option.label;
        toggleDropdown(false);
      });
      quickActionButton.addEventListener('click', (event) => {
        option.quickAction?.();
        event.preventDefault();
      });
      dropdownElement.appendChild(optionElement);
    });
  };

  inputElement.addEventListener('input', handleInputChange);
  clearButton.addEventListener('click', clearInput);
  inputElement.addEventListener('focus', () => toggleDropdown(true));
  inputElement.addEventListener('blur', (e) => {
    console.log(e);
    if (e.relatedTarget && (e.relatedTarget as HTMLElement).classList.contains('quick-action-btn'))
      return;
    toggleDropdown(false);
  });

  renderOptions();
  toggleOptionVisibility(options);
};

// Usage example
const options: Option[] = [
  { label: 'Option 1', quickAction: () => console.log('Quick action for Option 1') },
  { label: 'Option 2', quickAction: () => console.log('Quick action for Option 2') },
  { label: 'Option 3' },
  { label: 'Option 4' },
  { label: 'Option 5' },
];

export function init(el: HTMLElement | null) {
  initializeCustomCombobox(el, options);
}
