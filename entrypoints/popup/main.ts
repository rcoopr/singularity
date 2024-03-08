import { html } from '~/utils/misc';
import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = html`
  <h1 class="font-mono text-xl mb-2 text-center">Singularity</h1>
  <hr class="border-zinc-600" />
  <p class="text-zinc-400 mt-6 text-center">Made by Ross Cooper</p>
`;
