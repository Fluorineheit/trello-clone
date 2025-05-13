<script setup lang="ts">
</script>

<template>
  <div class="fixed inset-0 bg-black/30 flex items-center justify-center">
    <div class="bg-white p-5 rounded max-w-md w-full">
      <h2 class="font-medium text-lg">Add new Card</h2>
      <input type="text" placeholder="Title" class="w-full p-2 my-2 border rounded" />
      <textarea placeholder="Description" class="w-full p-2 my-2 border rounded"></textarea>
      <div class="flex justify-end gap-2">
        <button class="text-red-500 p-2 rounded hover:bg-gray-200">Cancel</button>
        <button class="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-700">Save</button>
      </div>
    </div>
  </div>
</template>
