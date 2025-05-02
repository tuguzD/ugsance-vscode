import { Language } from "../model";
import { QueryItem } from "../../queries/model";
import { tags } from "../../queries";
import * as block from "../../queries/items/block";
import * as flow from "../../queries/items/flow";
import * as unit from "../../queries/items/call-unit";
import { items } from ".";

const calls = [
    unit.item({
        item: 'method_declaration', name: 'identifier',
        body: 'block', args: 'formal_parameters',
    }),
    unit.item({
        item: 'constructor_declaration', name: 'identifier',
        body: 'constructor_body', args: 'formal_parameters',
    }),
    // TODO: enable again when lengths are fixed
    // new QueryItem({
    //     tag: tags.unit.item,
    //     type: 'compact_constructor_declaration',
    //     children: [
    //         new QueryItem({ tag: tags.unit.name, type: 'identifier' }),
    //         new QueryItem({ tag: tags.unit.body, type: 'block' }),
    //     ],
    // }),
    // unit.item({
    //     item: 'synchronized_statement', name: null,
    //     body: 'block', args: 'parenthesized_expression',
    // }),
    // new QueryItem({
    //     tag: tags.unit.item, type: 'lambda_expression',
    //     children: [
    //         new Alternation({ children: [
    //             new QueryItem({ tag: tags.unit.args, type: 'formal_parameters' }),
    //             new QueryItem({ tag: tags.unit.args, type: 'inferred_parameters' }),]
    //         }),
    //         new QueryItem({ tag: tags.unit.body, type: 'block' }),
    //     ],
    // }),
];

function dataItem(type: string, name_parent?: string) {
    var name = new QueryItem({ tag: 'name', type: 'identifier' });

    return new QueryItem({
        tag: 'data', type, children: [
            new QueryItem({ tag: 'type', type: '_', name: 'type', option: true, }),
            !name_parent ? name : new QueryItem({
                type: name_parent, children: [name], })
        ],
    });
}
const datas = [
    dataItem('field_declaration', 'variable_declarator'),
    dataItem('annotation_type_element_declaration'),
    dataItem('formal_parameter'),
];

function typeItem(type: string, body: string = 'class_body') {
    return new QueryItem({
        tag: 'type', type, children: [
            new QueryItem({ tag: 'name', type: 'identifier' }),
            new QueryItem({ tag: 'body', type: body }),
        ],
    });
}
const types = [
    typeItem('class_declaration'),
    typeItem('record_declaration'),
    typeItem('enum_declaration', 'enum_body'),
    typeItem('annotation_type_declaration', 'annotation_type_body'),
];
const jumps = block.items(tags.jump, [
    'return_statement',
    'break_statement', 'continue_statement',
    'yield_statement', 'throw_statement',
]);
const flows: QueryItem[] = [
    new QueryItem({
        tag: tags.flow.item, type: 'if_statement', children: [
            new QueryItem({ tag: tags.flow.body, type: 'block' }),
        ],
    }),
    // new QueryItem(tags.flow.item, 'if_statement', [new Alternation(null, [
    //     new QueryItem(tags.flow.body, 'statement'),
    //     new QueryItem(tags.flow.body, 'statement', [], false, true),
    // ])]),
    ...flow.items(tags.flow, ['switch_expression'],
        ['switch_block'], 'switch_block_statement_group',
        false, false, false),
    ...flow.items(tags.flow,
        ['try_statement', 'try_with_resources_statement'],
        ['catch_clause', 'finally_clause'],
        'block'),
];
const loops = block.items(tags.loop, [
    'do_statement', 'while_statement',
    'for_statement', 'enhanced_for_statement',
], 'statement');

export const Java: Language = {
    vscodeId: 'java',
    call: items(calls), type: items(types), data: items(datas),
    jump: items(jumps), loop: items(loops), flow: items(flows),
};
