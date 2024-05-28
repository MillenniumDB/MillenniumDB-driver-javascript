import MillenniumDBError from './millenniumdb-error';

/**
 * The Node class represents a node in the graph
 */
export class Node {
    /** The name of the node */
    public readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}

/**
 * The Edge class represents an edge in the graph
 */
export class Edge {
    /** The name of the edge */
    public readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}

/**
 * The DateTime class represents a date and time with an optional timezone
 */
export class DateTime {
    public readonly year: number;
    public readonly month: number;
    public readonly day: number;
    public readonly hour: number;
    public readonly minute: number;
    public readonly second: number;
    public readonly tzHour: number;
    public readonly tzMin: number;

    private static _dateTimeRegex =
        /^(\d+)-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|([+-]\d{2}):(\d{2}))?$/;

    constructor(str: string) {
        const dateTimeMatch = str.match(DateTime._dateTimeRegex);

        if (!dateTimeMatch) {
            throw new MillenniumDBError('Invalid DateTime string: ' + str);
        }

        this.year = parseInt(dateTimeMatch[1]!);
        this.month = parseInt(dateTimeMatch[2]!);
        this.day = parseInt(dateTimeMatch[3]!);
        this.hour = parseInt(dateTimeMatch[4]!);
        this.minute = parseInt(dateTimeMatch[5]!);
        this.second = parseInt(dateTimeMatch[6]!);

        if (!dateTimeMatch[7] || dateTimeMatch[7] === 'Z') {
            this.tzHour = 0;
            this.tzMin = 0;
        } else {
            this.tzHour = parseInt(dateTimeMatch[8]!);
            this.tzMin = parseInt(dateTimeMatch[9]!);
        }
    }

    toString(): string {
        let res = this.year.toString() + '-';
        res += this.month.toString().padStart(2, '0') + '-';
        res += this.day.toString().padStart(2, '0') + 'T';
        res += this.hour.toString().padStart(2, '0') + ':';
        res += this.minute.toString().padStart(2, '0') + ':';
        res += this.second.toString().padStart(2, '0');
        if (this.tzHour === 0 && this.tzMin === 0) {
            res += 'Z';
        } else {
            if (this.tzHour > -1) {
                res += '+';
            }
            res += this.tzHour.toString().padStart(2, '0') + ':';
            res += this.tzMin.toString().padStart(2, '0');
        }
        return res;
    }
}

/**
 * The PathSegment class represents a segment in the path
 */
export class PathSegment {
    /** The node from which the segment starts */
    public readonly from: Node;
    /** The node to which the segment ends */
    public readonly to: Node;
    /** The type of the segment */
    public readonly type: Node;
    /**
     * Whether the segment is reversed, useful for printing a sequence of segments. If reverse is true,
     * the segment should be printed as `(to)<-[type]-(from)` instead of `(from)-[type]->(to)`
     */
    public readonly reverse: boolean;

    constructor(from: Node, to: Node, type: Node, reverse: boolean) {
        this.from = from;
        this.to = to;
        this.type = type;
        this.reverse = reverse;
    }
}

export class Path {
    /** The start node of the path */
    public readonly start: Node;
    /** The end node of the path */
    public readonly end: Node;
    /** The segments in the path */
    public readonly segments: Array<PathSegment>;
    /** The number of segments in the path */
    public readonly length: number;

    constructor(start: Node, end: Node, segments: Array<PathSegment>) {
        this.start = start;
        this.end = end;
        this.segments = segments;
        this.length = segments.length;
    }
}
