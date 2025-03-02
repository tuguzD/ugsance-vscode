import { Language } from ".";
import { Alternation, QueryItem, queryItems } from "../queries";
import { tags } from "../queries/tag";
import * as unit from "../queries/call-unit";
import * as loop from "../queries/loop";

export const Java: Language = {
    vscodeId: 'java',
    jump: queryItems(tags.jump, [
        'return_statement',
        'break_statement', 'continue_statement',
        'yield_statement', 'throw_statement',
    ]),
    loop: loop.queryItems('statement', [
        'do_statement', 'while_statement',
        'for_statement', 'enhanced_for_statement',
    ]),
    callUnit: [
        unit.queryItem({
            unit: 'method_declaration', name: 'identifier',
            body: 'block', args: 'formal_parameters',
        }),
        unit.queryItem({
            unit: 'constructor_declaration', name: 'identifier',
            body: 'constructor_body', args: 'formal_parameters',
        }),
        unit.queryItem({
            unit: 'synchronized_statement', name: null,
            body: 'block', args: 'parenthesized_expression',
        }),
        new QueryItem(tags.unit.unit, 'lambda_expression', [
            new Alternation(null, [
                new QueryItem(tags.unit.args, 'formal_parameters'),
                new QueryItem(tags.unit.args, 'inferred_parameters'),
            ]),
            new QueryItem(tags.unit.body, 'block'),
        ]),
    ],
};
