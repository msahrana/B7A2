export const role = ['contributor', 'maintainer'] as const;

export type Role = (typeof role)[number];

export type User = {
    id: number;
    name: string;
    email: string;
    password: string;
    role: Role;
    created_at: Date;
    updated_at: Date;
};
export type RUser = Omit<
    User,
    'id' | 'created_at' | 'updated_at' | 'password'
>;

export type Issue = {
    id: number;
    title: string;
    description: string;
    type: string;
    status: string;
    reporter_id: number;
    created_at: Date;
    updated_at: Date;
};

export type NewOrder = Omit<Issue, 'id' | 'created_at' | 'updated_at'>;

export const USER_ROLE = {
    contributor: 'contributor',
    maintainer: 'maintainer',
} as const;
