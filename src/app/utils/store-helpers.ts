import { Actions, ofType } from '@ngrx/effects';
import { ActionCreator, Creator, Action } from '@ngrx/store';
import { merge, of } from 'rxjs';
import { map } from 'rxjs/operators';

export type AnyActionCreator = ActionCreator<
    string,
    Creator<any[], Action & Record<string, any>>
>;
export type ErrorActionCreator = ActionCreator<
    string,
    Creator<
        any[],
        Action & {
            error: {
                message: string | string[];
                [key: string]: any;
            };
            [key: string]: any;
        }
    >
>;

/** Returns an observable of the loading state, specified by `actionsToListenFor` i.e.:

 * | action type matching | loading state |
 * | ---------------------|---------------|
 * | `/error/i`           | `false`       |
 * | `/success/i`         | `false`       |
 * | all other cases      | `true`       |
 */
export const getLoadingUpdates = (
    actions$: Actions,
    actionsToListenFor: AnyActionCreator[]
) =>
    merge(
        of(false),
        actions$.pipe(
            ofType(...actionsToListenFor),
            map(({ type }) => {
                if (/success|error/i.test(type)) return false;
                else return true;
            })
        )
    );
