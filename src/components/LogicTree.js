const generateRandomValue = () => Math.floor(Math.random() * 1000);

const generateRandomValues = (size = 20) => {
  const values = new Set();
  while (values.size < size) {
    values.add(generateRandomValue());
  }
  return Array.from(values);
};

const insertBST = (root, value) => {
  if (!root) return { value, children: [] };
  if (value === root.value) return root;
  if (value < root.value) root.children[0] = insertBST(root.children[0] || null, value);
  else root.children[1] = insertBST(root.children[1] || null, value);
  return root;
};

const generateRandomDepth = () => Math.floor(Math.random() * 6) + 5;

const buildFibonacciTree = (depth) => {
  if (depth <= 1) return { value: 1, children: [] };

  let left = buildFibonacciTree(depth - 1);
  let right = buildFibonacciTree(depth - 2);

  return {
    value: left.value + right.value,
    children: [left, right],
  };
};

const insertAVL = (root, value) => {
  const height = (node) => (node ? node.height : 0);
  const balance = (node) => height(node.children[0]) - height(node.children[1]);

  const updateHeight = (node) => {
    if (node) node.height = 1 + Math.max(height(node.children[0]), height(node.children[1]));
  };

  const rotateRight = (y) => {
    let x = y.children[0];
    y.children[0] = x.children[1];
    x.children[1] = y;
    updateHeight(y);
    updateHeight(x);
    return x;
  };

  const rotateLeft = (x) => {
    let y = x.children[1];
    x.children[1] = y.children[0];
    y.children[0] = x;
    updateHeight(x);
    updateHeight(y);
    return y;
  };

  if (!root) return { value, height: 1, children: [] };
  if (value === root.value) return root;
  if (value < root.value) root.children[0] = insertAVL(root.children[0] || null, value);
  else root.children[1] = insertAVL(root.children[1] || null, value);

  updateHeight(root);

  let balanceFactor = balance(root);

  if (balanceFactor > 1) {
    if (value > root.children[0].value) root.children[0] = rotateLeft(root.children[0]);
    return rotateRight(root);
  }

  if (balanceFactor < -1) {
    if (value < root.children[1].value) root.children[1] = rotateRight(root.children[1]);
    return rotateLeft(root);
  }

  return root;
};

const insertBTree = (node, value) => {
  if (!node) return { values: [value], children: [] };

  if (node.children.length === 0) {
    if (!node.values.includes(value)) {
      node.values.push(value);
      node.values.sort((a, b) => a - b);
    }
  } else {
    let i = 0;
    while (i < node.values.length && value > node.values[i]) i++;
    node.children[i] = insertBTree(node.children[i], value);
  }

  if (node.values.length > 3) {
    const middleIndex = 1;
    const promotedValue = node.values[middleIndex];

    const leftNode = { values: node.values.slice(0, middleIndex), children: node.children.slice(0, middleIndex + 1) };
    const rightNode = { values: node.values.slice(middleIndex + 1), children: node.children.slice(middleIndex + 1) };

    return { values: [promotedValue], children: [leftNode, rightNode] };
  }

  return node;
};

const generateHash = (data) => {
  let json = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    let char = json.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
};

const generateTreeData = (algorithm, values) => {
  let root = null;

  if (algorithm === "bst") {
    values.forEach((v) => (root = insertBST(root, v)));
  } else if (algorithm === "avl") {
    values.forEach((v) => (root = insertAVL(root, v)));
  } else if (algorithm === "b-tree") {
    values.forEach((v) => (root = insertBTree(root, v)));
  } else if (algorithm === "fib-tree") {
    root = buildFibonacciTree(generateRandomDepth());
  }

  return { hash: generateHash(root), tree: root };
};

const benchmarkStructures = (values) => {
  return function () {
    const measureTime = (callback) => {
      const start = performance.now();
      callback();
      return (performance.now() - start).toFixed(4);
    };

    const fixedFibDepth = 10;

    return {
      BST: measureTime(() => {
        let root = null;
        values.forEach((v) => (root = insertBST(root, v)));
      }),
      AVL: measureTime(() => {
        let root = null;
        values.forEach((v) => (root = insertAVL(root, v)));
      }),
      "B-Tree": measureTime(() => {
        let root = null;
        values.forEach((v) => (root = insertBTree(root, v)));
      }),
      "Fib-Tree": measureTime(() => {
        let root = buildFibonacciTree(fixedFibDepth);
        let time = 0;
        const insertNode = (node) => {
          if (!node) return;
          time += parseFloat(measureTime(() => {})); // Mede o tempo de inserção de cada nó
          node.children.forEach(insertNode);
        };
        insertNode(root);
        return time.toFixed(4);
      }),
    };
  };
};

export { generateTreeData, generateRandomValues, benchmarkStructures };