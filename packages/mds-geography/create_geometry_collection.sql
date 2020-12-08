-- create index feature_geometry on geographies using GIST (ST_GeomFromGeoJSON(geography_json#>>'{features, 0, geometry}'));
SELECT  name,
ST_AsGeoJSON(ST_GeomFromGeoJSON(geography_json#>>'{features, 0, geometry}')) FROM geographies
WHERE ST_Intersects(ST_GeomFromGeoJSON(geography_json#>>'{features, 0, geometry}'), 'SRID=4326;POLYGON((28 53,27.707 52.293,27 52,26.293 52.293,26 53,26.293 53.707,27 54,27.707 53.707,28 53))'::geometry);


drop table geographies;
create table geographies (id serial, geography_json json, geometry_collection geometry);

CREATE TRIGGER do_geometry
BEFORE UPDATE OR INSERT ON geographies
FOR EACH ROW
EXECUTE PROCEDURE doGeometry();

CREATE OR REPLACE FUNCTION doGeometry() RETURNS TRIGGER AS $$
BEGIN
    NEW.geometry_collection = ST_COLLECT(ARRAY[ST_GeomFromGeoJSON((json_array_elements(NEW.geography_json->'features'))->'geometry')]);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

insert into geographies(geography_json) values('{"features": [{"geometry":{"type":"Point","coordinates":[-118.40704500,33.94248991]}}]}');

select geography_json, ST_asText(geometry_collection) from geographies;

-- ERROR:  set-returning functions are not allowed in UPDATE
-- LINE 1: ...collection = ST_COLLECT(ARRAY[ST_GeomFromGeoJSON((json_array...
--                                                              ^
-- QUERY:  UPDATE geographies SET geometry_collection = ST_COLLECT(ARRAY[ST_GeomFromGeoJSON((json_array_elements(geography_json->'features'))->'geometry')])
--     WHERE id = NEW.id
-- CONTEXT:  PL/pgSQL function dogeometry() line 4 at SQL statement



alter table geographies add column geometry_collection geometry;

alter table geographies alter column geometry_collection DEFAULT

update geographies set geometry_collection = new_geo
from
(select id,
ST_COLLECT(ARRAY[ST_GeomFromGeoJSON((json_array_elements(geography_json->'features'))->'geometry')]) as new_geo
from geographies) g1 where g1.id = geographies.id;

create index geographies_geometry_collection_gist_idx on geographies USING GIST (geometry_collection);

select id, name from geographies where ST_Intersects(geometry_collection,
'SRID=4326;POLYGON((-118.407045006752 33.9424899148675,-118.406530022621 33.9425433186046,-118.406525999308 33.9425077161169,-118.407042324543 33.9424543123574,-118.407045006752 33.9424899148675))');
--  id = 116 | Spot 2

--  id  |     name
-- -----+--------------
--   16 | Terminal 4
--   27 | LAX Boundary
--  116 | Spot 2
-- (3 rows)

select id, name from geographies where ST_Intersects(geometry_collection, ST_GeomFromGeoJSON('{"type":"Point","coordinates":[-118.40704500,33.94248991]}'));