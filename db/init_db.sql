
begin;

create table host_names(
    id              serial      not null primary key,
    host_name       text        not null,
    unique(host_name)
);

create table companies(
    id              serial      not null primary key,
    company_name    text        not null,
    unique(company_name)
);

create table host_company_mappings(
    id              serial      not null,
    host_name_id     serial      not null references host_names(id) primary key,
    company_id      serial      not null references companies(id)
);

commit;