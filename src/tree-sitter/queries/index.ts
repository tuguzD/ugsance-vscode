export class QueryItem {
    tag: string;
    type: string;
    children: Array<QueryItem>;

    get query(): string {
        let children: string = this.children.map(
            item => `\n${item.query}`
        ).join('');
        return `( ${this.type} ${children}) @${this.tag} `;
    }

    constructor(
        tag: string, type: string,
        children: Array<QueryItem> = [],
    ) {
        this.tag = tag;
        this.type = type;
        this.children = children;
    }
};
