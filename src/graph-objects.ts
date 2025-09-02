/**
 * The Node class represents a node in the graph
 */
export class GraphNode {
    /** The node identifier */
    public readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    toString(): string {
        return this.id;
    }
}

/**
 * The Edge class represents an edge in the graph
 */
export class GraphEdge {
    /** The edge identifier */
    public readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    toString(): string {
        return this.id;
    }
}

export class GraphAnon {
    /** The anonymous node identifier */
    public readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    toString(): string {
        return this.id;
    }
}

export class SimpleDate {
    public readonly year: number;
    public readonly month: number;
    public readonly day: number;
    public readonly tzMinuteOffset: number;

    constructor(year: number, month: number, day: number, tzMinuteOffset: number) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.tzMinuteOffset = tzMinuteOffset;
    }

    toString(): string {
        let res = this.year.toString() + '-';
        res += this.month.toString().padStart(2, '0') + '-';
        res += this.day.toString().padStart(2, '0');
        if (this.tzMinuteOffset === 0) {
            res += 'Z';
        } else {
            const tzHour = Math.floor(this.tzMinuteOffset / 60);
            const tzMin = this.tzMinuteOffset % 60;
            res += tzHour < 0 ? '-' : '+';
            res += Math.abs(tzHour).toString().padStart(2, '0') + ':';
            res += tzMin.toString().padStart(2, '0');
        }
        return res;
    }
}

export class Time {
    public readonly hour: number;
    public readonly minute: number;
    public readonly second: number;
    public readonly tzMinuteOffset: number;

    constructor(hour: number, minute: number, second: number, tzMinuteOffset: number) {
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.tzMinuteOffset = tzMinuteOffset;
    }

    toString(): string {
        let res = this.hour.toString().padStart(2, '0') + ':';
        res += this.minute.toString().padStart(2, '0') + ':';
        res += this.second.toString().padStart(2, '0');
        if (this.tzMinuteOffset === 0) {
            res += 'Z';
        } else {
            const tzHour = Math.floor(this.tzMinuteOffset / 60);
            const tzMin = this.tzMinuteOffset % 60;
            res += tzHour < 0 ? '-' : '+';
            res += Math.abs(tzHour).toString().padStart(2, '0') + ':';
            res += tzMin.toString().padStart(2, '0');
        }
        return res;
    }
}

export class DateTime {
    public readonly year: number;
    public readonly month: number;
    public readonly day: number;
    public readonly hour: number;
    public readonly minute: number;
    public readonly second: number;
    public readonly tzMinuteOffset: number;

    constructor(
        year: number,
        month: number,
        day: number,
        hour: number,
        minute: number,
        second: number,
        tzMinuteOffset: number
    ) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.tzMinuteOffset = tzMinuteOffset;
    }

    toString(): string {
        let res = this.year.toString() + '-';
        res += this.month.toString().padStart(2, '0') + '-';
        res += this.day.toString().padStart(2, '0') + 'T';
        res += this.hour.toString().padStart(2, '0') + ':';
        res += this.minute.toString().padStart(2, '0') + ':';
        res += this.second.toString().padStart(2, '0');
        if (this.tzMinuteOffset == 0) {
            res += 'Z';
        } else {
            const tzHour = Math.floor(this.tzMinuteOffset / 60);
            const tzMin = this.tzMinuteOffset % 60;
            res += tzHour < 0 ? '-' : '+';
            res += Math.abs(tzHour).toString().padStart(2, '0') + ':';
            res += tzMin.toString().padStart(2, '0');
        }
        return res;
    }
}

/**
 * The Decimal class represents an arbitrary-precision decimal.
 * TODO: Implement arithmetic operations
 */
export class Decimal {
    /** The string representation of the decimal */
    public readonly str: string;

    constructor(str: string) {
        this.str = str;
    }

    toString(): string {
        return this.str;
    }
}

export type Direction = 'left' | 'right' | 'undirected';

/**
 * The GraphPathSegment class represents a segment in the path
 */
export class GraphPathSegment {
    /** The node from which the segment starts */
    public readonly from: any;
    /** The node to which the segment ends */
    public readonly to: any;
    /** The type of the segment */
    public readonly type: any;
    /** The direction of the segment */
    public readonly direction: Direction;

    constructor(from: any, to: any, type: any, direction: Direction) {
        this.from = from;
        this.to = to;
        this.type = type;
        this.direction = direction;
    }
}

export class GraphPath {
    /** The start node of the path */
    public readonly start: any;
    /** The end node of the path */
    public readonly end: any;
    /** The segments in the path */
    public readonly segments: Array<GraphPathSegment>;
    /** The number of segments in the path */
    public readonly length: number;

    constructor(start: any, end: any, segments: Array<GraphPathSegment>) {
        this.start = start;
        this.end = end;
        this.segments = segments;
        this.length = segments.length;
    }
}

export class IRI {
    /** The string representation of the IRI */
    public readonly iri: string;

    constructor(iri: string) {
        this.iri = iri;
    }

    toString(): string {
        return `<${this.iri}>`;
    }
}

export class StringLang {
    /** The literal string */
    public readonly str: string;
    /** The language tag */
    public readonly lang: string;

    constructor(str: string, lang: string) {
        this.str = str;
        this.lang = lang;
    }

    toString(): string {
        return `"${this.str}"@${this.lang}`;
    }
}

export class StringDatatype {
    /** The literal string */
    public readonly str: string;
    /** The IRI of the datatype */
    public readonly datatype: IRI;

    constructor(str: string, datatype: string) {
        this.str = str;
        this.datatype = new IRI(datatype);
    }

    toString(): string {
        return `"${this.str}"^^<${this.datatype.toString()}>`;
    }
}
