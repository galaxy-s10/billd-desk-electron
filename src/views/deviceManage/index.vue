<template>
  <div class="setting-wrap">
    <div class="nav"></div>
    <div class="container">todo</div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.setting-wrap {
  box-sizing: border-box;
  height: 100vh;
  .nav {
    height: $top-system-bar-height;
  }
  .container {
    overflow: scroll;
    padding: 0 40px;
    height: calc(100vh - $top-system-bar-height);

    @extend %customScrollbarHide;
    &:hover {
      @extend %customScrollbar;
    }
  }
}
</style>
