const generateRandomValue = () => Math.floor(Math.random() * 1000);

/**
 * Gera um array de valores aleatórios únicos.
 * @param {number} size - O tamanho do array a ser gerado (padrão: 20).
 * @returns {number[]} - Um array de valores aleatórios únicos.
 */
const generateRandomValues = (size = 20) => {
  const values = new Set(); // Usamos um Set para garantir valores únicos
  while (values.size < size) {
    values.add(generateRandomValue());
  }
  return Array.from(values); // Converte o Set em um Array
};

/**
 * Insere um valor em uma Árvore de Busca Binária (BST).
 * @param {object} root - A raiz da árvore.
 * @param {number} value - O valor a ser inserido.
 * @returns {object} - A raiz da árvore após a inserção.
 */
const insertBST = (root, value) => {
  if (!root) return { value, children: [] }; // Se a raiz for nula, cria um novo nó
  if (value === root.value) return root; // Se o valor já existe, retorna a raiz existente
  if (value < root.value) root.children[0] = insertBST(root.children[0] || null, value); // Insere na subárvore esquerda
  else root.children[1] = insertBST(root.children[1] || null, value); // Insere na subárvore direita
  return root; // Retorna a raiz atualizada
};

/**
 * Gera uma profundidade aleatória para a Árvore de Fibonacci.
 * @returns {number} - Uma profundidade aleatória entre 5 e 10.
 */
const generateRandomDepth = () => Math.floor(Math.random() * 6) + 5;

/**
 * Constrói uma Árvore de Fibonacci com uma determinada profundidade.
 * @param {number} depth - A profundidade da árvore.
 * @returns {object} - A raiz da Árvore de Fibonacci.
 */
const buildFibonacciTree = (depth) => {
  if (depth <= 1) return { value: 1, children: [] }; // Caso base

  let left = buildFibonacciTree(depth - 1); // Subárvore esquerda
  let right = buildFibonacciTree(depth - 2); // Subárvore direita

  return {
    value: left.value + right.value, // Valor do nó é a soma dos valores dos filhos
    children: [left, right], // Filhos do nó
  };
};

/**
 * Insere um valor em uma Árvore AVL, mantendo o balanceamento.
 * @param {object} root - A raiz da árvore.
 * @param {number} value - O valor a ser inserido.
 * @returns {object} - A raiz da árvore após a inserção e balanceamento.
 */
const insertAVL = (root, value) => {
  const height = (node) => (node ? node.height : 0); // Obtém a altura de um nó
  const balance = (node) => height(node.children[0]) - height(node.children[1]); // Calcula o fator de balanceamento

  const updateHeight = (node) => {
    if (node) node.height = 1 + Math.max(height(node.children[0]), height(node.children[1])); // Atualiza a altura do nó
  };

  const rotateRight = (y) => {
    let x = y.children[0];
    y.children[0] = x.children[1];
    x.children[1] = y;
    updateHeight(y);
    updateHeight(x);
    return x; // Rotação para a direita
  };

  const rotateLeft = (x) => {
    let y = x.children[1];
    x.children[1] = y.children[0];
    y.children[0] = x;
    updateHeight(x);
    updateHeight(y);
    return y; // Rotação para a esquerda
  };

  if (!root) return { value, height: 1, children: [] }; // Se a raiz for nula, cria um novo nó
  if (value === root.value) return root; // Se o valor já existe, retorna a raiz existente
  if (value < root.value) root.children[0] = insertAVL(root.children[0] || null, value); // Insere na subárvore esquerda
  else root.children[1] = insertAVL(root.children[1] || null, value); // Insere na subárvore direita

  updateHeight(root); // Atualiza a altura do nó atual

  let balanceFactor = balance(root); // Calcula o fator de balanceamento

  // Aplica rotações para manter o balanceamento
  if (balanceFactor > 1) {
    if (value > root.children[0].value) root.children[0] = rotateLeft(root.children[0]);
    return rotateRight(root);
  }

  if (balanceFactor < -1) {
    if (value < root.children[1].value) root.children[1] = rotateRight(root.children[1]);
    return rotateLeft(root);
  }

  return root; // Retorna a raiz atualizada
};

/**
 * Insere um valor em uma Árvore B.
 * @param {object} node - O nó atual da árvore.
 * @param {number} value - O valor a ser inserido.
 * @returns {object} - O nó atualizado após a inserção e divisão (se necessário).
 */
const insertBTree = (node, value) => {
  if (!node) return { values: [value], children: [] }; // Se o nó for nulo, cria um novo nó

  if (node.children.length === 0) {
    if (!node.values.includes(value)) {
      node.values.push(value); // Adiciona o valor se não existir
      node.values.sort((a, b) => a - b); // Ordena os valores
    }
  } else {
    let i = 0;
    while (i < node.values.length && value > node.values[i]) i++; // Encontra a posição correta para inserir
    node.children[i] = insertBTree(node.children[i], value); // Insere na subárvore correta
  }

  // Divide o nó se ele tiver mais de 3 valores
  if (node.values.length > 3) {
    const middleIndex = 1;
    const promotedValue = node.values[middleIndex];

    const leftNode = { values: node.values.slice(0, middleIndex), children: node.children.slice(0, middleIndex + 1) };
    const rightNode = { values: node.values.slice(middleIndex + 1), children: node.children.slice(middleIndex + 1) };

    return { values: [promotedValue], children: [leftNode, rightNode] }; // Retorna o nó dividido
  }

  return node; // Retorna o nó atualizado
};

/**
 * Gera um hash para os dados da árvore.
 * @param {object} data - Os dados da árvore.
 * @returns {string} - O hash gerado.
 */
const generateHash = (data) => {
  let json = JSON.stringify(data); // Converte os dados em JSON
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    let char = json.charCodeAt(i);
    hash = (hash << 5) - hash + char; // Calcula o hash
    hash |= 0; // Garante que o hash seja um inteiro de 32 bits
  }
  return hash.toString(16); // Retorna o hash em hexadecimal
};

/**
 * Gera os dados da árvore com base no algoritmo selecionado.
 * @param {string} algorithm - O algoritmo de árvore selecionado (bst, avl, b-tree, fib-tree).
 * @param {number[]} values - Os valores a serem inseridos na árvore.
 * @returns {object} - Um objeto contendo o hash e a raiz da árvore gerada.
 */
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

/**
 * Realiza o benchmark das estruturas de dados.
 * @param {number[]} values - Os valores a serem usados no benchmark.
 * @returns {function} - Uma função que retorna os resultados do benchmark.
 */
const benchmarkStructures = (values) => {
  return function () {
    const measureTime = (callback) => {
      const start = performance.now();
      callback();
      return (performance.now() - start).toFixed(4); // Mede o tempo de execução
    };

    const fixedFibDepth = 10; // Profundidade fixa para a Árvore de Fibonacci

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