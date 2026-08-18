const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const state = {
    allItems: [],
    selectedIds: new Set(),
    sortedIds: [],
    idCounter: 1000000
};

function initializeData() {
    state.allItems = [];
    for (let i = 1; i <= state.idCounter; i++) {
        state.allItems.push({ id: i });
    }
    state.sortedIds = state.allItems.map(item => item.id);
}

initializeData();

function paginateItems(items, page, limit = 20) {
    const start = page * limit;
    const end = start + limit;
    return items.slice(start, end);
}

app.get('/', (req, res) => {
    res.json({
        endpoints: {
            items: '/api/items',
        }
    });
});

app.get('/api/items', (req, res) => {
    const { page = 0, search = '', window = 'left' } = req.query;
    const pageNum = parseInt(page);
    const searchQuery = search.toLowerCase();

    let items;

    if (window === 'left') {
        // Левое окно: все элементы, кроме выбранных
        items = state.allItems
            .filter(item => !state.selectedIds.has(item.id))
            .map(item => item.id);
    } else {
        // Правое окно: выбранные элементы в порядке сортировки
        items = state.sortedIds
            .filter(id => state.selectedIds.has(id));
    }

    if (searchQuery) {
        items = items.filter(id =>
            id.toString().includes(searchQuery)
        );
    }

    const total = items.length;
    const paginatedItems = paginateItems(items, pageNum, 20);

    res.json({
        items: paginatedItems,
        total,
        page: pageNum,
        hasMore: (pageNum + 1) * 20 < total
    });
});

app.listen(PORT, () => {
    console.log(PORT);
});