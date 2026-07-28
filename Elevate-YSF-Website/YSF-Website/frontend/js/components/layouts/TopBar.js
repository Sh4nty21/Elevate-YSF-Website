export default {

  name: 'Topbar',

  props: ['title'],

  template: `
    <header class="topbar">

      <h1>{{ title }}</h1>

    </header>
  `
};