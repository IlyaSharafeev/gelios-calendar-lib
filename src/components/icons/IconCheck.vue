<template>
  <svg
    :width="width"
    :height="height"
    :class="classes"
    :viewBox="`0 0 ${width} ${height}`"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g :opacity="opacity">
      <path d="M13.6791 4L6.34578 11.3333L3.01245 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    width: {
      type: String,
      default: '17',
    },
    height: {
      type: String,
      default: '16',
    },
    opacity: {
      type: String,
      default: '1',
    },
    classes: {
      type: String,
      required: false,
    },
  }
}
</script>
