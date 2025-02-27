export class QueryItem {
    tag: string | null;
    type: string;
    children: Array<QueryItem>;

    get query(): string {
        let children: string = this.children.map(
            item => `\n${item.query}`
        ).join('');
        let tag: string = (this.tag != null) ? `@${this.tag}` : '';
        return `( ${this.type} ${children}) ${tag} `;
    }

    constructor(
        tag: string | null, type: string,
        children: Array<QueryItem> = [],
    ) {
        this.tag = tag;
        this.type = type;
        this.children = children;
    }
};
