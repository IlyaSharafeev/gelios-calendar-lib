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
      <path
        d="M5.83317 9.99965L1.6665 12.083L9.70169 16.1006C9.81101 16.1552 9.86567 16.1826 9.923 16.1933C9.97378 16.2028 10.0259 16.2028 10.0767 16.1933C10.134 16.1826 10.1887 16.1552 10.298 16.1006L18.3332 12.083L14.1665 9.99965M1.6665 7.91631L9.70169 3.89872C9.81101 3.84406 9.86567 3.81673 9.923 3.80597C9.97378 3.79645 10.0259 3.79645 10.0767 3.80597C10.134 3.81673 10.1887 3.84406 10.298 3.89872L18.3332 7.91631L10.298 11.9339C10.1887 11.9886 10.134 12.0159 10.0767 12.0267C10.0259 12.0362 9.97378 12.0362 9.923 12.0267C9.86567 12.0159 9.81101 11.9886 9.70169 11.9339L1.6665 7.91631Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    width: {
      type: String,
      default: '24',
    },
    height: {
      type: String,
      default: '24',
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
