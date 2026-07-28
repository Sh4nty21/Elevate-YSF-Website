export default {
  name: 'NotFound',
  template: `
    <div style="min-height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:140px 24px 60px">
      <h1 style="font-size:4rem;color:var(--red)">404</h1>
      <p style="margin:12px 0 24px;color:var(--muted)">This page ran out of bounds.</p>
      <router-link to="/" class="btn btn-primary">Back to Home</router-link>
    </div>
  `,
};
