﻿import { Injectable } from "@angular/core";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { PromiseResp } from "./classes";
@Injectable()
export class Sql {
    private static db: SQLiteObject;
    constructor(sql: SQLite) {
        sql.create({ name: "CiboGrafico", location: "default" }).then(db => {
            Sql.db = db;
            db.executeSql("CREATE TABLE IF NOT EXISTS Options (Key UNIQUE, Value TEXT)", {});
        });
    }
    static selectOptions(key: string): Promise<PromiseResp> {
        return new Promise((resolve, reject) => {
            Sql.query("SELECT Value FROM Options WHERE Key=?", [key]).then(resp => {
                if (resp.rows.length > 0) resolve(new PromiseResp(true, resp.rows.item(0).Value));
                else reject(new PromiseResp(false, "Data doesn't exist !"));
            }).catch(e => reject(new PromiseResp(false, e)));
        });
    }
    static insertOptions(data: { key: string, value: string }): Promise<PromiseResp> {
        return new Promise((resolve, reject) => {
            Sql.isExistsOptions(data.key).then(isExists => {
                if (!isExists.response) {
                    Sql.query("INSERT INTO Options VALUES (?,?)", [data.key, data.value])
                        .then(resp => resolve(new PromiseResp(true, resp.rowsAffected > 0)))
                        .catch(e => reject(new PromiseResp(false, e)));
                } else reject(new PromiseResp(false, "Data already exists !"));
            }).catch(e => reject(new PromiseResp(false, e)));
        });
    }
    static updateOptions(data: { key: string, value: string }): Promise<PromiseResp> {
        return new Promise((resolve, reject) => {
            Sql.isExistsOptions(data.key).then(isExists => {
                if (isExists.response) {
                    Sql.query("UPDATE Options SET Value=? WHERE Key=?", [data.value, data.key])
                        .then(resp => resolve(new PromiseResp(true, resp.rowsAffected > 0)))
                        .catch(e => reject(new PromiseResp(false, e)));
                } else reject(new PromiseResp(false, "Data doesn't exist !"));
            });
        });
    }
    static insertOrUpdateOptions(data: { key: string, value: string }): Promise<PromiseResp> {
        return new Promise((resolve, reject) => {
            Sql.isExistsOptions(data.key).then(isExists => {
                if (isExists.response)
                    Sql.updateOptions(data).then(resp => resolve(resp)).catch(e => reject(new PromiseResp(false, e)));
                else if (!isExists.response)
                    Sql.insertOptions(data).then(resp => resolve(resp)).catch(e => reject(new PromiseResp(false, e)));
            });
        });
    }
    static deleteOptions(key: string): Promise<PromiseResp> {
        return new Promise((resolve, reject) => {
            Sql.isExistsOptions(key).then(isExists => {
                if (isExists.response) {
                    Sql.query("DELETE FROM Options WHERE Key=?", [key]).then(resp => resolve(new PromiseResp(true, resp
                        .rowsAffected > 0))).catch(e => reject(new PromiseResp(false, e)));
                } else reject(false);
            }).catch(e => reject(new PromiseResp(false, e)));
        });
    }
    static truncateOptions(): Promise<PromiseResp> {
        return new Promise((resolve, reject) => {
            Sql.query("DELETE FROM Options", {}).then(resp => resolve(new PromiseResp(true, resp
                .rowsAffected > 0))).catch(e => reject(new PromiseResp(false, e)));
        });
    }
    static isExistsOptions(key: string): Promise<PromiseResp> {
        return new Promise((resolve, reject) => {
            Sql.query("SELECT Value FROM Options WHERE Key=?", [key]).then(resp => resolve(new PromiseResp(true, resp
                .rows.length > 0))).catch(e => reject(new PromiseResp(false, e)));
        });
    }
    static query(query: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            Sql.db.executeSql(query, data).then(d => resolve(d)).catch(e => reject(e));
        });
    }
    static drop(table: string) { Sql.query(`DROP TABLE ${table}`, {}); }
    static isExistsFavorite(id: string): Promise<PromiseResp> {
        return new Promise((resolve, reject) => {
            Sql.selectOptions("favorites").then(resp => {
                resolve(new PromiseResp(true, (JSON.parse(resp.response) as string[]).find(favorite => favorite === id)) ? true : false);
            }).catch(e => reject(e));
        });
    }
    static insertFavorite(id: string): Promise<PromiseResp> {
        return new Promise((resolve, reject) => {
            Sql.isExistsFavorite(id).then(isExists => {
                if (!isExists.response) {
                    Sql.selectOptions("favorites").then(resp => {
                        let favorites: string[] = JSON.parse(resp.response);
                        favorites.push(id);
                        Sql.insertOrUpdateOptions({ key: "favorites", value: JSON.stringify(favorites) }).then(d => resolve(d)).catch(e => reject(e));
                    });
                } else reject(new PromiseResp(false, "Data already exists !"));
            }).catch(e => reject(new PromiseResp(false, e)));
        });
    }
}