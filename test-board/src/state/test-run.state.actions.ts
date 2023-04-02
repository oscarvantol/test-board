export namespace TestRunStateActions {

    export class Initialize {
        static readonly type = `[TestRunStateActions] Initialize`;
    }

    export class SetFavorite {
        static readonly type = `[TestRunStateActions] SetFavorite`;
        constructor(public id: string, public isFavorite: boolean) {
        }
    }

}