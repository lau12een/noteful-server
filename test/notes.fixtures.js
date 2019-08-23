function makeNotesArray() {
    return [
        {
            id: 1,
            title: 'Test Title 1',
            content: 'Test Content 1',
            date_modified: '2019-08-01T00:00:00.000Z',
            folder_id: 2
        },
        {
            id: 2,
            title: 'Test Title 2',
            content: 'Test Content 2',
            date_modified: '2019-08-02T00:00:00.000Z',
            folder_id: 1
        },
        {
            id: 3,
            title: 'Test Title 3',
            content: 'Test Content 3',
            date_modified: '2019-08-03T00:00:00.000Z',
            folder_id: 2
        },
        {
            id: 4,
            title: 'Test Title 4',
            content: 'Test Content 4',
            date_modified: '2019-08-04T00:00:00.000Z',
            folder_id: 1
        },
        {
            id: 5,
            title: 'Test Title 5',
            content: 'Test Content 5',
            date_modified: '2019-08-05T00:00:00.000Z',
            folder_id: 3
        }
    ]
}

function makeMaliciousNote() {
    const maliciousNote = {
        id: 911,
        title: 'Bad Note',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        folder_id: 3
    }

    const expectedNote = {
        ...maliciousNote,
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }

    return {
        maliciousNote,
        expectedNote
    }
}

module.exports = {
    makeNotesArray,
    makeMaliciousNote
}