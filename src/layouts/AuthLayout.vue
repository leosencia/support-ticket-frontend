<template>
  <div class="auth-page">
    <div class="auth-split">
      <section class="auth-panel">
        <div class="auth-panel__inner">
          <router-view />
        </div>
      </section>

      <aside class="auth-hero">
        <div class="auth-hero__blob" />
        <div class="auth-hero__content">
          <p class="auth-hero__eyebrow">Support tickets</p>
          <h2 class="auth-hero__title">
            Your hub for requests, updates, and resolutions
          </h2>
          <p class="auth-hero__lead">
            Track issues, collaborate with your team, and stay on top of every ticket — in one calm, focused workspace.
          </p>
          <div class="auth-hero__badge">
            <i class="pi pi-verified text-sm" aria-hidden="true" />
            <span>Built for clear communication</span>
          </div>
          <div class="auth-hero__frame">
            <img
              src="/dashboard-screenshot.png"
              alt="Dashboard preview"
              class="auth-hero__img"
              width="960"
              height="600"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
