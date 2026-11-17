<template>
  <div class="h-100 d-flex align-center justify-md-space-between justify-center">
    <span class="d-flex align-center text-medium-emphasis">
      &copy;
      {{ new Date().getFullYear() }}
      Signal Hub dashboard foundation
    </span>
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <RouterLink to="/">
        Overview
      </RouterLink>
      <RouterLink to="/data-blueprint">
        Data Blueprint
      </RouterLink>
    </span>
  </div>
</template>
