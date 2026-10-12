import { heapSort } from "./algoritmos/heap-sort.js";
import { mergeSort } from "./algoritmos/merge-sort.js";
import { quickSort } from "./algoritmos/quick-sort.js";

export const ALGORITMOS = {
  quick: {
    rotulo: "Quick Sort",
    funcao: quickSort,
    estavel: false,
  },
  merge: {
    rotulo: "Merge Sort",
    funcao: mergeSort,
    estavel: true,
  },
  heap: {
    rotulo: "Heap Sort",
    funcao: heapSort,
    estavel: false,
  },
};